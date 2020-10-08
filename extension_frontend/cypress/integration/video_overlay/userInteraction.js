/// <reference types="Cypress" />
import { visitAs } from "../../fixtures/utility";

describe("Main panel - General", () => {
  it("Switches to a panel when a button is clicked", () => {
    visitAs("broadcaster");
    cy.get("#notplaying-indicator").should("be.visible");
    // Switch to moderator panel
    cy.get(".main-panel-buttons button:not(.active)")
      .click()
      .should("have.class", "active");
    cy.get("#moderator-view").should("be.visible");
    // And back to the other one
    cy.get(".main-panel-buttons button:not(.active)")
      .click()
      .should("have.class", "active");
    cy.get("#moderator-view").should("not.be.visible");
    cy.get("#notplaying-indicator").should("be.visible");
  });

  it("Drags the panel when the panel dragger is held", () => {
    visitAs("viewer");
    cy.get("#main-panel").should(
      "have.attr",
      "style",
      "transform: translate(0px, 0px);"
    );
    cy.get(".main-panel-dragger")
      .trigger("mousedown")
      .trigger("mousemove", { clientX: 0, clientY: 0 })
      .trigger("mouseup");
    cy.get("#main-panel").should(
      "not.have.attr",
      "style",
      "transform: translate(0px);"
    );
  });
});

describe("Settings panel - Mode & Killer", () => {
  it("Switches mode to survivor, disabling Addons/Killer name, when Mode: Survivor is clicked", () => {
    visitAs("moderator");
    cy.get(".main-panel-buttons").contains("Settings").click();

    cy.get("button.game-mode.survivor").click().should("have.class", "active");

    cy.get("label")
      .should("have.length", 4)
      .each((label) => {
        if (label.text().includes("Killer") || label.text().includes("Addons"))
          cy.wrap(label).should("have.class", "inactive");
        else cy.wrap(label).should("not.have.class", "inactive");
      });
  });

  it("Switches mode to killer, enabling Killer name, when Mode: Killer is clicked", () => {
    visitAs("moderator");
    cy.get(".main-panel-buttons").contains("Settings").click();

    cy.get("button.game-mode.killer").click().should("have.class", "active");

    cy.get("label")
      .should("have.length", 4)
      .each((label) => {
        if (!label.text().includes("Addons"))
          cy.wrap(label).should("not.have.class", "inactive");
      });
  });

  it("Displays possible killer names on user input", () => {
    visitAs("moderator");
    cy.get(".main-panel-buttons").contains("Settings").click();
    cy.get("button.game-mode.killer").click();
    cy.get(".killer-search-container").within(() => {
      cy.get(".killer-search-bar").click().should("have.attr", "value", "");
      cy.get(".killer-search-results").should("be.visible");

      cy.get(".killer-search-bar").click().type("Doc");
      cy.get(".killer-search-results")
        .children()
        .should("have.length", 1)
        .and("contain.text", "doctor")
        .click();
      cy.get(".killer-search-bar").should("have.value", "doctor");

      cy.get(".killer-search-bar")
        .blur()
        .click()
        .should("have.value", "")
        .type("demo");
      cy.get(".killer-search-results")
        .children()
        .should("have.length", 1)
        .and("contain.text", "demogorgon");
    });
  });

  it("Displays all killers if the search is empty (at least 20 currently)", () => {
    visitAs("moderator");
    cy.get(".main-panel-buttons").contains("Settings").click();
    cy.get("button.game-mode.killer").click();
    cy.get(".killer-search-container").within(() => {
      cy.get(".killer-search-bar").click().should("have.attr", "value", "");
      cy.get(".killer-search-results").should("be.visible");
      cy.get(".killer-search-results li").should("have.length.gte", 20);
    });
  });

  it("Enables Addons when a killer name has been selected", () => {
    visitAs("moderator");
    cy.get(".main-panel-buttons").contains("Settings").click();
    cy.get("button.game-mode.killer").click();
    cy.get(".killer-search-container").within(() => {
      cy.get(".killer-search-bar").click().should("have.attr", "value", "");
      cy.get(".killer-search-results").should("be.visible");

      cy.get(".killer-search-bar").click().type("Hunt");
      cy.get(".killer-search-results")
        .children()
        .should("have.length", 1)
        .and("contain.text", "huntress")
        .click();
      cy.get(".killer-search-bar").should("have.value", "huntress");
    });
    cy.get("label")
      .should("have.length", 4)
      .each((label) => {
        cy.wrap(label).should("not.have.class", "inactive");
      });
  });

  it("Switches mode to Not Playing, disabling all other build inputs, when Mode: Not Playing is clicked", () => {
    visitAs("moderator");
    cy.get(".main-panel-buttons").contains("Settings").click();
    cy.get("button.not-playing").click().should("have.class", "active");
    cy.get("label")
      .should("have.length", 4)
      .each((label) => {
        if (label.text().includes("Mode"))
          cy.wrap(label).should("have.not.class", "inactive");
        else cy.wrap(label).should("have.class", "inactive");
      });
    cy.get(".perk-slot").should("not.be.visible");
    cy.get(".addon-slot").should("not.be.visible");
  });
});

describe("Settings Panel - Perks", () => {});

describe("Settings Panel - Addons", () => {});

describe("Settings panel - Publish/Reset/Clear", () => {
  it("Sets a Build when the Publish button is clicked and a valid build has been made", () => {});

  it("Resets to the currently live version when the Reset button is clicked", () => {});

  it("Clears the build and sets Mode to Not Playing when Clear is clicked", () => {});
});

describe("Build panel - General", () => {
  it("should display perk information when a perk has been clicked", () => {});
});
