/// <reference types="Cypress" />
import { visitAs } from "../../fixtures/utility";

describe("First open", () => {
  it("should start on the build tab without a Build if one isn't already available", () => {
    visitAs("viewer");
    cy.get("#main-panel").should("contain.text", "not in game");
  });
});

describe("Permission", () => {
  it("Does not display the settings button for viewer users", () => {
    visitAs("viewer");
    cy.get(".main-panel-buttons")
      .children()
      .should("not.contain.text", "Settings");
  });
  it("Does not display the settings button for moderator users when moderators aren't allowed to set", () => {
    visitAs("moderator", undefined, 0);
    cy.get(".main-panel-buttons")
      .children()
      .should("not.contain.text", "Settings");
  });

  it("Displays the settings button for moderators when configuration says all moderators can set", () => {
    visitAs("moderator", undefined, 1);
    cy.get(".main-panel-buttons").children().should("contain.text", "Settings");
  });
  it("Displays the settings button for moderators when configuration says some moderators can set and we are one of those", () => {
    visitAs("moderator", undefined, 2);
    cy.get(".main-panel-buttons").children().should("contain.text", "Settings");
  });
  it("Displays the settings button for broadcasters", () => {
    visitAs("broadcaster");
    cy.get(".main-panel-buttons").children().should("contain.text", "Settings");
  });
});
