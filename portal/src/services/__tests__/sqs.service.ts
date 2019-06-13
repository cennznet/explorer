import { Test } from '@nestjs/testing';
import { SqsService } from '../sqs.service';


describe('SQSService', () => {
	let sqsService: SqsService;

	beforeEach(async cb => {
		const module = await Test.createTestingModule({
			providers: [SqsService],
		}).compile();
		sqsService = module.get<SqsService>(SqsService);
		cb();
	});
});
