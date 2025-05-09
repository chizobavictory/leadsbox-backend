import { Request, Response } from 'express';
import { ResponseUtils } from '../utils/reponse';
import { StatusCode } from '../types/response';
import { Toolbox } from '../utils/tools';

class FacebookAuthController {
  public async facebookCallback(req: Request, res: Response): Promise<void> {
    console.log('Received Facebook callback');
    const user = req.user as any;
    try {
      if (!user || !user.token) {
        const clientUrl = process.env.CLIENT_URL || 'http://localhost3010';
        return res.redirect(`${clientUrl}/login?error=facebook_auth_failed`);
      }

      const clientUrl = process.env.CLIENT_URL || 'http://localhost:3010';
      const redirectUrl = `${clientUrl}/facebook?token=${encodeURIComponent(
        user.token
      )}`;
      console.log('Redirecting to:', redirectUrl);

      return res.redirect(redirectUrl);
    } catch (err) {
      console.error('Error:', err);
      return ResponseUtils.error(
        res,
        err instanceof Error ? err.message : String(err),
        StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }
}

export const FacebookAuthCtrl = new FacebookAuthController();
