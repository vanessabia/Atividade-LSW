const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
const partidasRoutes = require('./routes/partidasRoutes');


const app = express();
const PORT = process.env.PORT || 3000;

const dataDir = path.join(__dirname, 'data');
const partidasFile = path.join(dataDir, 'partidas.json');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

if (!fs.existsSync(partidasFile)) {
  fs.writeFileSync(partidasFile, JSON.stringify([], null, 2), 'utf8');
}

console.log(typeof partidasRoutes); 
console.log(partidasRoutes); 

console.log('Tipo de partidasRoutes:', typeof partidasRoutes);
console.log('Conteúdo de partidasRoutes:', partidasRoutes);

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, '../frontend')));

app.use('/api/partidas', partidasRoutes);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/html/index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});