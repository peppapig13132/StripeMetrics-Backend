import { Request, Response } from "express";

export default (app: any) => {
  app.get('/api', (req: Request, res: Response) => {
    res.send('Express.js server is running!');
  });
  app.use("*", function (req: Request, res: Response) {
    res.status(404).send('404 | Bad request!');
  });
}