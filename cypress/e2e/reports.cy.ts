describe('Sistema de Relatórios', () => {
  const testUser = Cypress.env('testUser');

  beforeEach(() => {
    cy.login(testUser.email, testUser.password);
    cy.visit('/reports');
  });

  it('deve carregar a página de relatórios', () => {
    cy.get('h1').should('contain', 'Relatórios');
    cy.get('[data-testid="date-range-picker"]').should('be.visible');
    cy.get('button').contains('Gerar Relatório').should('be.visible');
  });

  it('deve gerar relatório com sucesso', () => {
    cy.get('[data-testid="date-range-picker"]').click();
    cy.get('.rdp-day').first().click();
    cy.get('.rdp-day').last().click();
    cy.get('button').contains('Gerar Relatório').click();
    cy.get('[data-testid="report-overview"]').should('be.visible');
  });

  it('deve exibir gráficos corretamente', () => {
    cy.get('button').contains('Gerar Relatório').click();
    cy.get('[data-testid="monthly-chart"]').should('be.visible');
    cy.get('[data-testid="books-chart"]').should('be.visible');
  });

  it('deve alternar entre abas', () => {
    cy.get('button').contains('Gerar Relatório').click();
    cy.get('[role="tab"]').contains('Livros').click();
    cy.get('[data-testid="books-chart"]').should('be.visible');
    cy.get('[role="tab"]').contains('Usuários').click();
    cy.get('[data-testid="users-table"]').should('be.visible');
  });

  it('deve manter tema escuro/claro consistente', () => {
    cy.get('button').contains('Gerar Relatório').click();
    cy.toggleTheme();
    cy.checkTheme('dark');
    cy.get('[data-testid="monthly-chart"]').should('have.class', 'dark');
    cy.get('[data-testid="books-chart"]').should('have.class', 'dark');
  });
}); 