const API_URL = 'http://localhost:3000/api/partidas';

const formPartida = document.getElementById('form-partida');
const formJogador = document.getElementById('form-jogador');
const listaPartidas = document.getElementById('lista-partidas');
const listaJogadores = document.getElementById('lista-jogadores');
const semPartidas = document.getElementById('sem-partidas');
const semJogadores = document.getElementById('sem-jogadores');
const contadorJogadores = document.getElementById('contador-jogadores');
const partidaIdInput = document.getElementById('partida-id');
const btnExcluirPartida = document.getElementById('btn-excluir-partida');

const jogadoresModal = new bootstrap.Modal(document.getElementById('modal-jogadores'));

document.addEventListener('DOMContentLoaded', carregarPartidas);

formPartida.addEventListener('submit', criarPartida);
formJogador.addEventListener('submit', adicionarJogador);
btnExcluirPartida.addEventListener('click', confirmarExclusaoPartida);

async function carregarPartidas() {
  try {
    const response = await fetch(API_URL);
    const partidas = await response.json();
    
    renderizarPartidas(partidas);
  } catch (error) {
    exibirMensagem('Erro ao carregar partidas', 'danger');
    console.error('Erro ao carregar partidas:', error);
  }
}

function renderizarPartidas(partidas) {
  listaPartidas.innerHTML = '';
  
  if (partidas.length === 0) {
    semPartidas.classList.remove('d-none');
    return;
  }
  
  semPartidas.classList.add('d-none');
  
  partidas.forEach(partida => {
    const dataFormatada = new Date(partida.data).toLocaleDateString('pt-BR');
    const totalJogadores = partida.jogadores.length;
    const confirmados = partida.jogadores.filter(j => j.confirmado).length;
    
    const partidaCard = document.createElement('div');
    partidaCard.className = 'col-md-6 mb-4';
    partidaCard.innerHTML = `
      <div class="card partida-card h-100" data-id="${partida.id}">
        <div class="card-body">
          <h5 class="card-title">${partida.titulo}</h5>
          <p class="card-text mb-1">
            <i class="fas fa-map-marker-alt me-1"></i> ${partida.local}
          </p>
          <p class="card-text data-partida mb-2">
            <i class="far fa-calendar-alt me-1"></i> ${dataFormatada} às ${partida.horario}
          </p>
          <div class="d-flex justify-content-between align-items-center mt-3">
            <span class="badge bg-secondary">${totalJogadores} jogadores</span>
            <span class="contador-confirmados">
              <i class="fas fa-check-circle me-1"></i> ${confirmados} confirmados
            </span>
          </div>
        </div>
      </div>
    `;
    
    partidaCard.querySelector('.partida-card').addEventListener('click', () => {
      abrirModalJogadores(partida);
    });
    
    listaPartidas.appendChild(partidaCard);
  });
}

async function criarPartida(event) {
  event.preventDefault();
  
  const titulo = document.getElementById('titulo').value;
  const local = document.getElementById('local').value;
  const data = document.getElementById('data').value;
  const horario = document.getElementById('horario').value;
  
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ titulo, local, data, horario })
    });
    
    if (!response.ok) {
      throw new Error('Erro ao criar partida');
    }
    
    formPartida.reset();
    carregarPartidas();
    exibirMensagem('Partida criada com sucesso!', 'success');
  } catch (error) {
    exibirMensagem('Erro ao criar partida', 'danger');
    console.error('Erro ao criar partida:', error);
  }
}

async function excluirPartida(partidaId) {
  try {
    const response = await fetch(`${API_URL}/${partidaId}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      throw new Error('Erro ao excluir partida');
    }
    
    jogadoresModal.hide();
    carregarPartidas();
    exibirMensagem('Partida excluída com sucesso!', 'success');
  } catch (error) {
    exibirMensagem('Erro ao excluir partida', 'danger');
    console.error('Erro ao excluir partida:', error);
  }
}

function confirmarExclusaoPartida() {
  const partidaId = partidaIdInput.value;
  
  if (confirm('Tem certeza que deseja excluir esta partida?')) {
    excluirPartida(partidaId);
  }
}

function abrirModalJogadores(partida) {
  document.querySelector('.modal-title').textContent = `Gerenciar Jogadores - ${partida.titulo}`;
  partidaIdInput.value = partida.id;
  
  renderizarJogadores(partida.jogadores);
  jogadoresModal.show();
}

function renderizarJogadores(jogadores) {
  listaJogadores.innerHTML = '';
  contadorJogadores.textContent = jogadores.length;
  
  if (jogadores.length === 0) {
    semJogadores.classList.remove('d-none');
    return;
  }
  
  semJogadores.classList.add('d-none');
  
  jogadores.forEach(jogador => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${jogador.nome}</td>
      <td>${jogador.telefone}</td>
      <td>
        <i class="fas fa-check-circle confirmacao-jogador ${jogador.confirmado ? 'confirmado' : 'pendente'}" 
           data-id="${jogador.id}" title="${jogador.confirmado ? 'Presença confirmada' : 'Confirmar presença'}"></i>
      </td>
      <td>
        <i class="fas fa-trash-alt btn-remover-jogador" data-id="${jogador.id}" title="Remover jogador"></i>
      </td>
    `;
    
    const btnConfirmar = row.querySelector('.confirmacao-jogador');
    btnConfirmar.addEventListener('click', () => {
      confirmarPresencaJogador(jogador.id);
    });
    
    const btnRemover = row.querySelector('.btn-remover-jogador');
    btnRemover.addEventListener('click', () => {
      removerJogador(jogador.id);
    });
    
    listaJogadores.appendChild(row);
  });
}

async function adicionarJogador(event) {
  event.preventDefault();
  
  const partidaId = partidaIdInput.value;
  const nome = document.getElementById('nome-jogador').value;
  const telefone = document.getElementById('telefone-jogador').value;
  
  try {
    const response = await fetch(`${API_URL}/${partidaId}/jogadores`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ nome, telefone })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erro ao adicionar jogador');
    }
    
    formJogador.reset();
    await recarregarPartidaAtual();
  } catch (error) {
    exibirMensagem(error.message, 'danger');
    console.error('Erro ao adicionar jogador:', error);
  }
}

async function removerJogador(jogadorId) {
  const partidaId = partidaIdInput.value;
  
  try {
    const response = await fetch(`${API_URL}/${partidaId}/jogadores/${jogadorId}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      throw new Error('Erro ao remover jogador');
    }
    
    await recarregarPartidaAtual();
  } catch (error) {
    exibirMensagem('Erro ao remover jogador', 'danger');
    console.error('Erro ao remover jogador:', error);
  }
}

async function confirmarPresencaJogador(jogadorId) {
  const partidaId = partidaIdInput.value;
  
  try {
    const response = await fetch(`${API_URL}/${partidaId}/jogadores/${jogadorId}/confirmar`, {
      method: 'PATCH'
    });
    
    if (!response.ok) {
      throw new Error('Erro ao confirmar presença');
    }
    
    await recarregarPartidaAtual();
  } catch (error) {
    exibirMensagem('Erro ao confirmar presença', 'danger');
    console.error('Erro ao confirmar presença:', error);
  }
}

async function recarregarPartidaAtual() {
  const partidaId = partidaIdInput.value;
  
  try {
    const response = await fetch(`${API_URL}/${partidaId}`);
    const partida = await response.json();
    
    renderizarJogadores(partida.jogadores);
    await carregarPartidas(); 
  } catch (error) {
    console.error('Erro ao recarregar partida:', error);
  }
}

function exibirMensagem(mensagem, tipo) {
  const alertDiv = document.createElement('div');
  alertDiv.className = `alert alert-${tipo} alert-dismissible fade show position-fixed top-0 end-0 m-3`;
  alertDiv.setAttribute('role', 'alert');
  alertDiv.innerHTML = `
    ${mensagem}
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Fechar"></button>
  `;
  
  document.body.appendChild(alertDiv);

  setTimeout(() => {
    alertDiv.remove();
  }, 5000);
}