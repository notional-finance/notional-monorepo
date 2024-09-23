import KanbanApp from 'views/apps/kanban';

// ==============================|| PAGE ||============================== //

type Props = {
  params: {
    tab: string;
  };
};

// Multiple versions of this page will be statically generated
// using the `params` returned by `generateStaticParams`
export default function Page({ params }: Props) {
  const { tab } = params;

  return <KanbanApp tab={tab} />;
}

// Return a list of `params` to populate the [slug] dynamic segment
export async function generateStaticParams() {
  const response = ['board', 'backlogs'];

  return response.map((tab: string) => ({
    tab: tab
  }));
}
