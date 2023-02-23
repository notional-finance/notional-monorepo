import { useContext } from 'react';
import { getGhostContentAPI } from '@notional-finance/helpers';
import { VaultActionContext } from '../vault-view/vault-action-provider';
import { PostOrPage } from '@tryghost/content-api';
import { useEffect, useState } from 'react';

interface OverviewContent {
  heading: string;
  paragraphs: string[];
}

export const useVaultDocs = (vaultAddress: string) => {
  const [overviewContent, setOverviewContent] = useState<OverviewContent[]>();
  const [docsLink, setDocsLink] = useState<string>();
  const [financialModelLink, setFinancialModelLink] = useState<string>();
  const { state: { strategyName } } = useContext(VaultActionContext);

  useEffect(() => {
    if (!vaultAddress || !strategyName) return;
    const api = getGhostContentAPI();
    api.pages
      // First attempt to read the slug at the vault address which allows
      // for vault specific documentation
      .read({ slug: vaultAddress.toLowerCase() })
      .then(parsePage)
      .catch(() => {
        api.pages
          // Second attempt to read the slug at the strategy name for more
          // generic documentation
          .read({ slug: strategyName.toLowerCase() })
          .then(parsePage)
          .catch((e) => {
            console.error(e);
          });
      });
  }, [vaultAddress, strategyName]);

  const parsePage = (page: PostOrPage) => {
    if (page.html) {
      const doc = new DOMParser().parseFromString(page.html, 'text/html');
      const overviewContent = new Array<OverviewContent>();
      doc.body.childNodes.forEach((n) => {
        if (n.nodeName.startsWith('H')) {
          overviewContent.push({
            heading: n.textContent || '',
            paragraphs: [] as string[],
          });
        } else if (n.nodeName === 'P') {
          const lastContent = overviewContent[overviewContent.length - 1];
          lastContent.paragraphs.push(n.textContent || '');
        } else if (n.nodeName === 'A') {
          const el = n as Element;
          if (el.id === 'doc-link') {
            setDocsLink(el.attributes.getNamedItem('href')?.textContent || '');
          } else if (el.id === 'sheets-link') {
            setFinancialModelLink(
              el.attributes.getNamedItem('href')?.textContent || ''
            );
          }
        }
        setOverviewContent(overviewContent);
      });
    }
  };

  return {
    overviewContent,
    docsLink,
    financialModelLink,
  };
};
