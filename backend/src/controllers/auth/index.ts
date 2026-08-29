import { AuthRegisterController } from './auth-register.controller';
import { AuthSessionController } from './auth-session.controller';
import { AuthPasswordController } from './auth-password.controller';

export class AuthController {
  private regCtrl = new AuthRegisterController();
  private sessCtrl = new AuthSessionController();
  private pwCtrl = new AuthPasswordController();

  register = this.regCtrl.register.bind(this.regCtrl);
  verifyEmail = this.regCtrl.verifyEmail.bind(this.regCtrl);
  resendVerification = this.regCtrl.resendVerification.bind(this.regCtrl);
  login = this.sessCtrl.login.bind(this.sessCtrl);
  logout = this.sessCtrl.logout.bind(this.sessCtrl);
  refreshToken = this.sessCtrl.refreshToken.bind(this.sessCtrl);
  getSessions = this.sessCtrl.getSessions.bind(this.sessCtrl);
  revokeSession = this.sessCtrl.revokeSession.bind(this.sessCtrl);
  forgotPassword = this.pwCtrl.forgotPassword.bind(this.pwCtrl);
  resetPassword = this.pwCtrl.resetPassword.bind(this.pwCtrl);
  changePassword = this.pwCtrl.changePassword.bind(this.pwCtrl);
  getMe = this.pwCtrl.getMe.bind(this.pwCtrl);
}

export const authController = new AuthController();
