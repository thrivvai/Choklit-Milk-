import { SkillManifest } from '../../shared-types/src/index.js';

export const starterSkills: SkillManifest[] = [
  {
    id: 'meeting-brief',
    name: 'Meeting Brief',
    description: 'Summarize context and propose agenda with decisions and risks.',
    allowedActions: ['summarize', 'draft_message'],
    requiredTier: 'draft',
    defaultRisk: 'medium'
  },
  {
    id: 'follow-up-draft',
    name: 'Follow Up Draft',
    description: 'Draft post-meeting follow up with owners and deadlines.',
    allowedActions: ['draft_message'],
    requiredTier: 'draft',
    defaultRisk: 'medium'
  },
  {
    id: 'voice-note-priorities',
    name: 'Voice Note to Priorities',
    description: 'Convert voice notes into a priority list and next actions.',
    allowedActions: ['summarize', 'draft_message'],
    requiredTier: 'read',
    defaultRisk: 'low'
  }
];

export function listStarterSkills(): SkillManifest[] {
  return starterSkills;
}
