import { Metadata } from 'next';
import { FileText } from 'lucide-react';
import { LegalPage, LegalSection } from '@/components/legal/legal-page';
import { TodoNote } from '@/components/legal/todo-note';

export const metadata: Metadata = {
  title: 'Download Forms · JestATP',
  description: 'Downloadable forms for account, broker-authorisation, and grievance actions.',
};

interface FormEntry {
  name: string;
  purpose: string;
  format: string;
}

function FormList({ forms }: { forms: FormEntry[] }) {
  return (
    <ul className="!list-none !space-y-3 !pl-0">
      {forms.map((f) => (
        <li key={f.name} className="flex items-start gap-3 rounded border border-border bg-surface p-4">
          <FileText className="mt-0.5 h-4 w-4 shrink-0 text-text-tertiary" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-text-primary">{f.name}</p>
            <p className="mt-0.5 text-sm text-text-secondary">{f.purpose}</p>
          </div>
          <a
            href="#"
            className="shrink-0 rounded border border-border-strong px-3 py-1.5 text-xs font-medium text-text-secondary hover:border-accent-trust hover:text-accent-trust"
          >
            {f.format}
          </a>
        </li>
      ))}
    </ul>
  );
}

const sections: LegalSection[] = [
  {
    id: 'about',
    heading: 'About these forms',
    body: (
      <TodoNote>
        Upload the actual PDF/DOCX files to object storage and wire real download URLs before launch — links below
        are placeholders.
      </TodoNote>
    ),
  },
  {
    id: 'account-forms',
    heading: 'Account forms',
    body: (
      <FormList
        forms={[
          { name: 'Account Closure Request', purpose: 'Request permanent closure of your JestATP account.', format: 'PDF' },
          { name: 'Nomination Update', purpose: 'Update nomination details linked to your account profile.', format: 'PDF' },
          { name: 'Data Export Request', purpose: 'Request a full export of your account, strategy, and order data.', format: 'PDF' },
        ]}
      />
    ),
  },
  {
    id: 'broker-forms',
    heading: 'Broker authorisation forms',
    body: (
      <FormList
        forms={[
          { name: 'API Authorisation Revocation', purpose: 'Formally revoke a broker API authorisation outside the in-app flow.', format: 'PDF' },
          { name: 'Change of Broker Declaration', purpose: 'Declare a switch from one connected broker to another.', format: 'PDF' },
        ]}
      />
    ),
  },
  {
    id: 'grievance-forms',
    heading: 'Grievance and dispute forms',
    body: (
      <FormList
        forms={[
          { name: 'Complaint Registration Form', purpose: 'Formal complaint submission ahead of SCORES/SMART ODR escalation.', format: 'PDF' },
          { name: 'Power of Attorney (for representation)', purpose: 'Authorise a representative to pursue a grievance on your behalf.', format: 'PDF' },
        ]}
      />
    ),
  },
  {
    id: 'help',
    heading: 'Need a form that isn&apos;t listed?',
    body: <p>Contact <a href="/support">Help &amp; Support</a> and we&apos;ll point you to the right form or process.</p>,
  },
];

export default function FormsPage() {
  return (
    <LegalPage
      title="Download Forms"
      lastUpdated="19 September 2026"
      intro={<p>Forms for account, broker-authorisation, and grievance actions that aren&apos;t self-service in the app.</p>}
      sections={sections}
    />
  );
}
