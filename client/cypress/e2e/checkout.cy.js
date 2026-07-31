describe("Checkout Flow", () => {
  beforeEach(() => {
    // Intercept backend requests if necessary, e.g., to stub Razorpay keys
    cy.intercept("GET", "**/api/keys/razorpay", {
      statusCode: 200,
      body: { key: "rzp_test_fake_key_123" }
    }).as("getRazorpayKey");

    cy.intercept("POST", "**/api/checkout", {
      statusCode: 200,
      body: {
        id: "order_fake123",
        amount: 500000,
        currency: "INR"
      }
    }).as("createOrder");
  });

  it("should allow a user to add a product to cart and open the checkout drawer", () => {
    // 1. Visit the home page (assuming products are loaded here or on /home)
    cy.visit("/home");

    // 2. Wait for products to load (assuming there's a loader or products render)
    // We can just look for an 'Add to Cart' button.
    cy.get("button").contains(/Add to Cart/i).first().click();

    // 3. Open the cart drawer
    cy.get("button[aria-label*='Cart']").click();

    // 4. Verify cart drawer is visible and item is in cart
    cy.get("h2").contains("Your Cart").should("be.visible");
    cy.get("button").contains(/Checkout/i).should("be.visible").click();

    // 5. If we have a checkout flow/form, we should see it
    cy.get("h2").contains("Shipping & Payment").should("be.visible");

    // 6. Fill out the shipping form
    cy.get("input[placeholder*='Address']").type("123 Test Street");
    cy.get("input[placeholder*='City']").type("Mumbai");
    cy.get("input[placeholder*='PIN']").type("400001");

    // 7. Proceed to Payment
    cy.get("button").contains(/Proceed to Payment/i).click();

    // 8. Verify the order creation was called
    cy.wait("@createOrder").then((interception) => {
      expect(interception.response.statusCode).to.eq(200);
      expect(interception.response.body).to.have.property("id", "order_fake123");
    });
    
    // Note: Interacting with the Razorpay iframe directly is tricky in Cypress, 
    // so we typically stop the test here or mock the Razorpay handler success callback.
  });
});
