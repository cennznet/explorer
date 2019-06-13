import { Controller, Get, NotFoundException, Query, Res } from '@nestjs/common';

@Controller()
export class ContractController {

	@Get('contracts')
	public async home(@Res() res) {	
		res.render('pages/contracts');
	}
	
}
