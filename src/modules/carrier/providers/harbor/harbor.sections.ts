import type { CarrierSection } from '../../carrier.types';

// Harbor's questions, one section per page. Date of birth is on page 1.
const harborSections: readonly CarrierSection[] = [
  {
    id: 'about_you',
    title: 'About you',
    fields: ['applicant_full_name', 'date_of_birth', 'contact_email', 'phone'],
  },
  {
    id: 'your_home',
    title: 'Your home',
    fields: ['residence_state', 'postal_code', 'building_has_sprinklers'],
  },
  { id: 'coverage', title: 'Coverage', fields: ['contents_coverage'] },
  { id: 'pets', title: 'Pets', fields: ['pets', 'dog_breed'] },
  { id: 'claims_history', title: 'Claims history', fields: ['claims_last_5_years'] },
];

export { harborSections };
