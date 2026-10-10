import httpClient from '@/services/httpClient'

export const listarClientes = () => httpClient.get('/clientes')
export const resumoClientes = () => httpClient.get('/clientes/resumo')
export const estenderTeste = (id, dias) => httpClient.patch(`/clientes/${id}/estender-teste`, { dias })
export const liberarCliente = (id, planoId, ate) => httpClient.patch(`/clientes/${id}/liberar`, { planoId, ate })
export const criarCliente = (dados) => httpClient.post('/clientes', dados)
export const editarCliente = (id, dados) => httpClient.patch(`/clientes/${id}`, dados)
export const excluirCliente = (id) => httpClient.delete(`/clientes/${id}`)
export const redefinirSenhaCliente = (id, novaSenha) => httpClient.patch(`/clientes/${id}/senha`, { novaSenha })
export const pagamentosDoCliente = (id) => httpClient.get(`/clientes/${id}/pagamentos`)
export const bloquearCliente = (id, bloqueado) => httpClient.patch(`/clientes/${id}/bloqueio`, { bloqueado })

export const listarPlanos = () => httpClient.get('/planos')
export const criarPlano = (dados) => httpClient.post('/planos', dados)
export const atualizarPlano = (id, dados) => httpClient.patch(`/planos/${id}`, dados)
export const removerPlano = (id) => httpClient.delete(`/planos/${id}`)
