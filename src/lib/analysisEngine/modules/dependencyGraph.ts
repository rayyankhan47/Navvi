import { FileAnalysis, ComponentAnalysis, Relationship } from '../types';
import * as path from 'path';

export function analyzeDependencyGraph(files: FileAnalysis[]): { components: ComponentAnalysis[]; relationships: Relationship[] } {
  // Group files by top-level folder (component)
  const componentMap = new Map<string, string[]>();
  files.forEach(file => {
    const relPath = file.path.replace(/\\/g, '/');
    const topLevel = relPath.split('/')[0];
    if (!componentMap.has(topLevel)) componentMap.set(topLevel, []);
    componentMap.get(topLevel)!.push(file.path);
  });

  // Build ComponentAnalysis objects
  const components: ComponentAnalysis[] = [];
  componentMap.forEach((filePaths, name) => {
    const componentFiles = files.filter(f => filePaths.includes(f.path));
    const dependencies = Array.from(new Set(componentFiles.flatMap(f => f.dependencies)));
    const dependents: string[] = []; // To be filled below
    const complexity = componentFiles.reduce((sum, f) => sum + f.complexity.cyclomatic, 0);
    components.push({
      name,
      type: inferComponentType(name),
      files: filePaths,
      dependencies,
      dependents,
      complexity,
      description: `Files: ${filePaths.length}`
    });
  });

  // Build relationships between components based on imports
  const relationships: Relationship[] = [];
  const fileToComponent = new Map<string, string>();
  components.forEach(comp => {
    comp.files.forEach(f => fileToComponent.set(f, comp.name));
  });
  files.forEach(file => {
    const fromComponent = fileToComponent.get(file.path);
    file.dependencies.forEach(dep => {
      // Try to resolve dep to a file in the repo
      const depFile = files.find(f => f.path.endsWith(dep) || f.path === dep);
      if (depFile) {
        const toComponent = fileToComponent.get(depFile.path);
        if (toComponent && toComponent !== fromComponent) {
          relationships.push({
            from: fromComponent!,
            to: toComponent,
            type: 'imports',
            strength: 0.8
          });
        }
      }
    });
  });

  // Fill dependents for each component
  components.forEach(comp => {
    comp.dependents = components
      .filter(c => c.dependencies.includes(comp.name))
      .map(c => c.name);
  });

  return { components, relationships };
}

function inferComponentType(name: string): ComponentAnalysis['type'] {
  if (name.match(/page|route/i)) return 'page';
  if (name.match(/util|helper|lib/i)) return 'utility';
  if (name.match(/service/i)) return 'service';
  if (name.match(/api/i)) return 'api';
  return 'component';
} 