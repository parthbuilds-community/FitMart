describe('Authentication Flow', () => {
  beforeEach(() => {
    // Navigate to the auth page before each test
    cy.visit('/auth')
  })

  it('renders the Sign In form by default', () => {
    cy.contains('h2', 'Welcome back').should('be.visible')
    cy.get('input[name="email"]').should('be.visible')
    cy.get('input[name="password"]').should('be.visible')
    cy.contains('button', 'Sign In').should('be.visible')
  })

  it('toggles to the Sign Up form', () => {
    // Click "Sign up" toggle
    cy.contains('button', 'Sign up').click()
    
    // Verify Sign Up form elements
    cy.contains('h2', 'Create an account').should('be.visible')
    cy.get('input[name="name"]').should('be.visible')
    cy.get('input[name="email"]').should('be.visible')
    cy.get('input[name="password"]').should('be.visible')
    cy.get('input[name="confirm"]').should('be.visible')
    cy.contains('button', 'Create Account').should('be.visible')
  })

  it('shows an error on invalid sign in', () => {
    cy.get('input[name="email"]').type('invalid@example.com')
    cy.get('input[name="password"]').type('wrongpassword')
    cy.contains('button', 'Sign In').click()
    
    // Firebase auth should throw an error, which we display
    cy.contains('Invalid email or password').should('be.visible').or('contain', 'account found')
  })
})

describe('Protected Routes', () => {
  it('redirects unauthenticated users to home/landing', () => {
    // Attempting to visit profile without logging in
    cy.visit('/profile')
    // The NonAdminRoute logic might redirect them
    // Check that we are not on the profile page
    cy.url().should('not.include', '/profile')
  })
})
