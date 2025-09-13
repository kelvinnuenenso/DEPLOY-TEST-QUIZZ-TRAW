import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

const execAsync = promisify(exec);

async function createProjectZip() {
  try {
    // Lista de arquivos e diretórios para excluir do ZIP
    const excludeList = [
      'node_modules',
      '.env',
      '.env.*',
      'dist',
      'coverage',
      '.git',
      'cypress/videos',
      'cypress/screenshots',
      '*.log',
      '*.zip'
    ];

    // Criar o comando de exclusão para o PowerShell
    const excludePattern = excludeList.map(item => `-Exclude '${item}'`).join(' ');

    // Nome do arquivo ZIP baseado no nome do projeto e data
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const zipName = `quiz-lift-off-${timestamp}.zip`;

    // Comando PowerShell para criar o ZIP
    const command = `
      $compress = @{
        Path = './*'
        CompressionLevel = 'Fastest'
        DestinationPath = './${zipName}'
      }
      Compress-Archive @compress ${excludePattern}
    `;

    // Executar o comando
    console.log('Criando arquivo ZIP...');
    await execAsync(`powershell -Command "${command}"`);

    console.log(`\nArquivo ZIP criado com sucesso: ${zipName}`);
    console.log('Arquivos excluídos:', excludeList.join(', '));

  } catch (error) {
    console.error('Erro ao criar o arquivo ZIP:', error);
    process.exit(1);
  }
}

createProjectZip();