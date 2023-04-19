import { INestApplication } from '@nestjs/common';
import { ExpressAdapter } from '@bull-board/express';
import { createBullBoard } from '@bull-board/api';
import { BullAdapter } from '@bull-board/api/bullAdapter';

import { config } from '@config';
import { QUEUE_NAME } from '@shared/constants';

export function initQueueBoard(app: INestApplication) {
  if (config.NODE_ENV === config.PROD) return;

  const bullBoardAdapter = new ExpressAdapter();
  bullBoardAdapter.setBasePath(`/${config.QUEUE_BOARD_NAMESPACE}`);

  const queues = Object.values(QUEUE_NAME).map((queueName) => {
    return new BullAdapter(app.get(`BullQueue_${queueName}`), {
      allowRetries: true,
    });
  });

  createBullBoard({
    queues: queues,
    serverAdapter: bullBoardAdapter,
  });

  app.use(`/${config.QUEUE_BOARD_NAMESPACE}`, bullBoardAdapter.getRouter());
}
