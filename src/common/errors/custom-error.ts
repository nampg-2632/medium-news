export type CustomErrorResponse = {
  errors: {
    body: string[];
  };
};

export function createCustomError(
  messages: string | string[],
): CustomErrorResponse {
  return {
    errors: {
      body: Array.isArray(messages) ? messages : [messages],
    },
  };
}
