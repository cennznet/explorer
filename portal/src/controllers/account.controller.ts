import { Controller, Get, NotFoundException, Query, Res } from '@nestjs/common';

@Controller()
export class AccountController {

	@Get('account')
	public async home(@Res() res) {	
		res.render('pages/account');
	}
	
}
