import type { Allergen } from '../types';

interface Props {
  allergen: Allergen;
}

export function AllergenBadge({ allergen }: Props) {
  return <span className="badge badge-allergen">{allergen.name}</span>;
}
