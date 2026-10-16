import { NotFoundException, ParseUUIDPipe } from '@nestjs/common';
import { createCustomError } from '../../common/errors/custom-error';

// A malformed id cannot match any comment, so it is reported as not found
// instead of reaching the uuid column.
export class ParseCommentIdPipe extends ParseUUIDPipe {
  constructor() {
    super({
      exceptionFactory: () =>
        new NotFoundException(createCustomError('comment not found')),
    });
  }
}
