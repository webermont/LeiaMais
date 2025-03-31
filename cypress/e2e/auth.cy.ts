describe('Autenticação', () => {
  const testUser = Cypress.env('testUser');

  beforeEach(() => {
    cy.visit('/login');
  });

  it('deve fazer login com sucesso', () => {
    cy.login(testUser.email, testUser.password);
    cy.url().should('include', '/dashboard');
    cy.get('[data-testid="user-menu"]').should('be.visible');
  });

  it('deve mostrar erro com credenciais inválidas', () => {
    cy.get('input[name="email"]').type('invalid@example.com');
    cy.get('input[name="password"]').type('wrong');
    cy.get('button[type="submit"]').click();
    cy.get('[data-testid="error-message"]').should('be.visible');
  });

  it('deve fazer logout com sucesso', () => {
    cy.login(testUser.email, testUser.password);
    cy.get('[data-testid="user-menu"]').click();
    cy.get('[data-testid="logout-button"]').click();
    cy.url().should('include', '/login');
  });
}); 