import { Injectable, OnModuleInit } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import { plainToClass } from 'class-transformer';
import { config } from '../common/config';
import { logger } from '../common/logger';
import { BlockMessage } from '../entities/block.message';

@Injectable()
export class SqsService implements OnModuleInit{

	private client: AWS.SQS;
	private timer: NodeJS.Timer;
	private latestBlockHeigh: number;


	public onModuleInit() {
		this.client = new AWS.SQS({
			credentials: {
				accessKeyId: config.get('AWS_ACCESS_ID'),
				secretAccessKey: config.get('AWS_ACCESS_KEY'),
			},
			region: config.get('aws.sqs.region'),
			apiVersion: config.get('aws.sqs.apiVersion')});
		this.latestBlockHeigh = 0;
	}


	public consume(handler: (messages: BlockMessage[]) => void) {
		this.timer = setTimeout(async() => {
			try {
				const msg = await this.getMessage();
				logger.debug('received msg',  { msg });
				if(msg.length) {
					handler(msg);
				}
			} catch (e) {
				logger.error('SQS data error.', {error: e});
			} finally {
				await this.consume(handler);
			}
		}, 0);
	}

	public getMessage(): Promise<BlockMessage[]> {
		const params = {
			QueueUrl: config.get('aws.sqs.url'),
			WaitTimeSeconds: 20
		};
		return new Promise((resolve, reject) => {
			this.client.receiveMessage(params, (err, data) => {
				if (err) {
					return reject(err);
				}

				if(data.Messages) {
					const rawMessages = data.Messages.map(m => JSON.parse(m.Body));
					const entries = data.Messages.map(m => { return {
						Id: m.MessageId,
						ReceiptHandle: m.ReceiptHandle
					}});
					const deletedParams = {
						Entries: entries,
						QueueUrl: config.get('aws.sqs.url')
					}
					this.client.deleteMessageBatch(deletedParams, (error, res) => {
						if(error) {
							logger.error('delete messages failed', {error});
						}
					});
					const results = rawMessages.filter(m => {
						if(this.latestBlockHeigh && this.latestBlockHeigh < m.blockNumber) {
							return true;
						}
						if(this.latestBlockHeigh === 0) {
							this.latestBlockHeigh = m.blockNumber;
							return true;
						}
						return false;
					});
					return resolve(plainToClass(BlockMessage, results));
				}
				resolve([]);
			});
		})

	}

}
