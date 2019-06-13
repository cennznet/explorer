import * as nunjucks from 'nunjucks';
import { humanReadableTime } from '../../../common/time';
import { short, shorten } from '../../../common/format';
import { toStdUnit } from '../../../common/unit-convert';

const wsUrl = $('meta[name=wsUrl]').attr('content');
const socket = window.io(`${wsUrl}/notify`);
const latestBlockList = $('.block-list');
const blockInner = $('.block-inner');
const latestTxTable = $('.tx-table');
const tBody = latestTxTable.find('tbody');
const hiddenClass = 'hiddenBlock';

const txHtml = `<tr>
        <td><a href="tx/{{tx.hash}}" data-toggle="tooltip" title="{{tx.hash}}">
    {{tx.hash | short}}
  </a></td>
        <td class="anim-time" data-time="{{ tx.timestamp }}">{{ tx.timestamp | ago }}</td>
        <td><a href="/addresses/{{tx.fromAddress}}" data-toggle="tooltip" title="{{tx.fromAddress}}">
    {{tx.fromAddress | short}}
  </a></td>
        <td><i class="fas fa-long-arrow-alt-right"></i></td>
        <td><a href="/addresses/{{tx.toAddress}}" data-toggle="tooltip" title="{{tx.toAddress}}">
    {{tx.toAddress | short}}
  </a></td>
        <td>{{ tx.value | toStdUnit  }} {{ tx.assetSymbol }}</td>
      </tr>`;

const evn = new nunjucks.Environment();
let blockTemplate;

blockInner.on('transitionend', () => {
	blockInner
		.removeClass('anim')
		.removeClass('adding')
		.prepend(blockTemplate);
	latestBlockList
		.find('a')
		.last()
		.remove();
	blockInner
		.find('a')
		.first()
		.addClass(hiddenClass);
});

socket.on('latestBlock', data => {
	evn.addFilter('ago', humanReadableTime);
	evn.addFilter('short', short);
	evn.addFilter('toStdUnit', toStdUnit);
	const block = data.messages.block;
	const txns = data.messages.txns.txns;
	const firstChild = blockInner.find('.block').first();
	blockTemplate = firstChild.clone();
	// set values
	firstChild.attr('href', `/blocks/${block.number}`);
	firstChild.find('h3').text(`#${block.number}`);
	const p =
		firstChild
			.find('p')
			.first();
	p.text(humanReadableTime(block.timestamp));
	p.attr('data-time', block.timestamp.toString());
	firstChild.find('#txCount').text(block.transactionCount);
	firstChild.find('#author').text(short(block.author));
	firstChild.find('#validators').text(block.validators.length);
	firstChild.removeClass(hiddenClass);
	blockInner.addClass('anim').addClass('adding');

	txns.forEach(tx => {
		const newTx = evn.renderString(txHtml, { tx });
		tBody
			.find('tr')
			.last()
			.remove();
		tBody.prepend(newTx);
	});

});
