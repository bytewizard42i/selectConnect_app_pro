const { runStructuralTests } = require('../../midnight-modules/tests/structural-test-helper.cjs');
const path = require('path');

runStructuralTests('abuse-escrow', path.join(__dirname, '..', 'build', 'abuse-escrow', 'contract', 'index.d.ts'), {
  expected: ['advance_epoch', 'configure_card_bond', 'post_bond', 'refund_bond', 'register_card_admin', 'slash_bond'],
  mustHave: ['post_bond', 'slash_bond', 'refund_bond'],
});

runStructuralTests('contact-grant', path.join(__dirname, '..', 'build', 'contact-grant', 'contract', 'index.d.ts'), {
  expected: ['add_reveal_level', 'advance_epoch', 'assert_reveal_allowed', 'create_card', 'deactivate_card', 'issue_contact_grant', 'revoke_contact_grant', 'unlock_next_level'],
  mustHave: ['create_card', 'issue_contact_grant', 'assert_reveal_allowed', 'revoke_contact_grant'],
});
