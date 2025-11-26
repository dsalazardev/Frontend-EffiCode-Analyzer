import React from 'react';
import { SafeInlineMath } from '../ui/SafeMath';
import { type LineCost } from '../../types';
import './LineCostsTable.css';

interface LineCostsTableProps {
  costs: LineCost[];
}

export const LineCostsTable: React.FC<LineCostsTableProps> = ({ costs }) => {
  if (!costs || costs.length === 0) {
    return (
      <div className="line-costs-table line-costs-table--empty">
        <p>No hay costos de línea disponibles.</p>
      </div>
    );
  }

  return (
    <div className="line-costs-table">
      <div className="line-costs-table__header">
        <span className="line-costs-table__icon">📊</span>
        <h3 className="line-costs-table__title">Costo por Línea</h3>
      </div>

      <div className="line-costs-table__wrapper">
        <table className="line-costs-table__table">
          <thead>
            <tr>
              <th className="line-costs-table__th line-costs-table__th--line">Línea</th>
              <th className="line-costs-table__th line-costs-table__th--description">Descripción</th>
              <th className="line-costs-table__th line-costs-table__th--cost">Costo</th>
            </tr>
          </thead>
          <tbody>
            {costs.map((cost, index) => (
              <tr key={index} className="line-costs-table__row">
                <td className="line-costs-table__td line-costs-table__td--line">
                  <span className="line-costs-table__line-num">
                    {cost.line !== null ? cost.line : '-'}
                  </span>
                </td>
                <td className="line-costs-table__td line-costs-table__td--description">
                  <span className="line-costs-table__description">{cost.description || '-'}</span>
                </td>
                <td className="line-costs-table__td line-costs-table__td--cost">
                  <SafeInlineMath math={cost.cost || '0'} fallback={cost.cost || '0'} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LineCostsTable;
