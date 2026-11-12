'use strict';

module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/inquiries/intake',
      handler: 'intake.create',
      config: { auth: false },
    },
    {
      method: 'PATCH',
      path: '/inquiries/intake/:documentId',
      handler: 'intake.updateDelivery',
      config: { auth: false },
    },
  ],
};
