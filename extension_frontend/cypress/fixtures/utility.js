export function waitForData() {
  return new Cypress.Promise((resolve) =>
    cy.window().its("socket").once("new_build", resolve)
  );
}

// canset: 0=no 1=all 2=some
export function visitAs(role, channel, canset) {
  cy.visit(
    "/video_overlay.html?role=" +
      role +
      "&channel=" +
      (channel || "123") +
      "&name=testname&canset=" +
      (canset || "1")
  );
  return waitForData();
}
