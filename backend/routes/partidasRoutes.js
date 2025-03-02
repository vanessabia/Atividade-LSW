const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const router = express.Router();

module.exports =  router ;

const partidasFile = path.join(__dirname, '../data/partidas.json');

async function readPartidasFile() {
  try {
    const data = await fs.readFile(partidasFile, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Erro ao ler arquivo de partidas:', error);
    return [];
  }
}

async function writePartidasFile(partidas) {
  try {
    await fs.writeFile(partidasFile, JSON.stringify(partidas, null, 2), 'utf8');
  } catch (error) {
    console.error('Erro ao escrever no arquivo de partidas:', error);
    throw error;
  }
}

router.get('/', async (req, res) => {
  try {
    const partidas = await readPartidasFile();
    res.json(partidas);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao listar partidas' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const partidas = await readPartidasFile();
    const partida = partidas.find(p => p.id === Number(req.params.id));
    
    if (!partida) {
      return res.status(404).json({ message: 'Partida não encontrada' });
    }
    
    res.json(partida);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar partida' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { titulo, local, data, horario } = req.body;
    
    if (!titulo || !local || !data || !horario) {
      return res.status(400).json({ message: 'Todos os campos são obrigatórios' });
    }
    
    const partidas = await readPartidasFile();
    
    const novaPartida = {
      id: Date.now().toString(),
      titulo,
      local,
      data,
      horario,
      jogadores: [],
      criadaEm: new Date().toISOString()
    };
    
    partidas.push(novaPartida);
    await writePartidasFile(partidas);
    
    res.status(201).json(novaPartida);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar partida' });
  }
});

router.post('/:id/jogadores', async (req, res) => {
  try {
    const { nome, telefone } = req.body;
    
    if (!nome || !telefone) {
      return res.status(400).json({ message: 'Nome e telefone são obrigatórios' });
    }
    
    const partidas = await readPartidasFile();
    const partidaIndex = partidas.findIndex(p => p.id === req.params.id);
    
    if (partidaIndex === -1) {
      return res.status(404).json({ message: 'Partida não encontrada' });
    }
    
    const jogadorExistente = partidas[partidaIndex].jogadores.find(j => j.nome === nome);
    if (jogadorExistente) {
      return res.status(400).json({ message: 'Jogador já adicionado' });
    }
    
    const novoJogador = {
      id: Date.now().toString(),
      nome,
      telefone,
      confirmado: false
    };
    
    partidas[partidaIndex].jogadores.push(novoJogador);
    await writePartidasFile(partidas);
    
    res.status(201).json(novoJogador);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao adicionar jogador' });
  }
});

router.delete('/:partidaId/jogadores/:jogadorId', async (req, res) => {
  try {
    const { partidaId, jogadorId } = req.params;
    
    const partidas = await readPartidasFile();
    const partidaIndex = partidas.findIndex(p => p.id === partidaId);
    
    if (partidaIndex === -1) {
      return res.status(404).json({ message: 'Partida não encontrada' });
    }
    
    const jogadorIndex = partidas[partidaIndex].jogadores.findIndex(j => j.id === jogadorId);
    
    if (jogadorIndex === -1) {
      return res.status(404).json({ message: 'Jogador não encontrado' });
    }
    
    partidas[partidaIndex].jogadores.splice(jogadorIndex, 1);
    await writePartidasFile(partidas);
    
    res.json({ message: 'Jogador removido com sucesso' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao remover jogador' });
  }
});

router.patch('/:partidaId/jogadores/:jogadorId/confirmar', async (req, res) => {
  try {
    const { partidaId, jogadorId } = req.params;
    
    const partidas = await readPartidasFile();
    const partidaIndex = partidas.findIndex(p => p.id === partidaId);
    
    if (partidaIndex === -1) {
      return res.status(404).json({ message: 'Partida não encontrada' });
    }
    
    const jogadorIndex = partidas[partidaIndex].jogadores.findIndex(j => j.id === jogadorId);
    
    if (jogadorIndex === -1) {
      return res.status(404).json({ message: 'Jogador não encontrado' });
    }
    
    partidas[partidaIndex].jogadores[jogadorIndex].confirmado = 
      !partidas[partidaIndex].jogadores[jogadorIndex].confirmado;
    
    await writePartidasFile(partidas);
    
    res.json(partidas[partidaIndex].jogadores[jogadorIndex]);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao confirmar presença' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const partidas = await readPartidasFile();
    const partidaIndex = partidas.findIndex(p => p.id === req.params.id);
    
    if (partidaIndex === -1) {
      return res.status(404).json({ message: 'Partida não encontrada' });
    }
    
    partidas.splice(partidaIndex, 1);
    await writePartidasFile(partidas);
    
    res.json({ message: 'Partida excluída com sucesso' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao excluir partida' });
  }
});