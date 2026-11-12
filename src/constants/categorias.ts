import type { CategoriaId } from '../types';

export type Categoria = {
  id: CategoriaId;
  nome: string;
  cor: string; // cor de fundo do selo da categoria no card
};

export const CATEGORIAS: Categoria[] = [
  { id: 'academico', nome: 'Acadêmico', cor: '#E3EDFA' },
  { id: 'pets', nome: 'Pets', cor: '#FDF0E1' },
  { id: 'tecnologia', nome: 'Tecnologia', cor: '#E4F5EC' },
  { id: 'design', nome: 'Design', cor: '#F3E8FA' },
  { id: 'entregas', nome: 'Entregas', cor: '#FCE8E8' },
  { id: 'outros', nome: 'Outros', cor: '#ECEFF3' },
];

export function obterCategoria(id: CategoriaId): Categoria {
  return CATEGORIAS.find(c => c.id === id) ?? CATEGORIAS[CATEGORIAS.length - 1];
}
