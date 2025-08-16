// index.js for PR Label Action
// This is a placeholder. Replace with your label sync logic or call an API as needed.

const core = require('@actions/core');
const github = require('@actions/github');

async function run() {
  try {
    const prNumber = core.getInput('pr_number');
    core.info(`PR Label Action running for PR #${prNumber}`);

    // 1. Sugerir etiquetas usando el CLI de projex
    const { execSync } = require('child_process');
    let labels = '';
    try {
      labels = execSync('projex pull-request labels suggest --format csv', { encoding: 'utf-8' }).trim();
    } catch (e) {
      core.warning('No se pudieron sugerir etiquetas automáticamente.');
    }
    if (!labels) {
      core.info('No hay etiquetas sugeridas.');
      return;
    }
    const newLabels = labels.split(',').map(l => l.trim()).filter(Boolean);
    if (newLabels.length === 0) {
      core.info('No hay etiquetas sugeridas.');
      return;
    }

    // 2. Obtener etiquetas actuales del PR
    const token = core.getInput('github_token') || process.env.GITHUB_TOKEN;
    if (!token) throw new Error('GitHub token is required as input or env var GITHUB_TOKEN');
    const octokit = github.getOctokit(token);
    const { data: pr } = await octokit.rest.pulls.get({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      pull_number: Number(prNumber),
    });
    const currentLabels = pr.labels.map(l => l.name);
    // 3. Calcular etiquetas a agregar y quitar
    const labelsToRemove = currentLabels.filter(l => !newLabels.includes(l));
    const labelsToAdd = newLabels.filter(l => !currentLabels.includes(l));
    // 4. Remover etiquetas que ya no aplican
    for (const label of labelsToRemove) {
      await octokit.rest.issues.removeLabel({
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        issue_number: Number(prNumber),
        name: label,
      }).catch(() => {});
    }
    // 5. Agregar etiquetas nuevas
    if (labelsToAdd.length > 0) {
      await octokit.rest.issues.addLabels({
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        issue_number: Number(prNumber),
        labels: labelsToAdd,
      });
    }
    core.info(`Etiquetas sincronizadas: ${newLabels.join(', ')}`);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
