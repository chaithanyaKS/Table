import React, { useEffect, useMemo, useRef, useState } from "react";

import styles from "./Table.module.css";

const Table = ({ headers, rows }) => {
  const selection = Object.assign({}, Array(rows.length).fill(false));

  const [tableRows, setTableRows] = useState(rows);
  const [rowData, setRowData] = useState(rows);
  const [selected, setSelected] = useState(selection);
  const [selectAll, setSelectAll] = useState(false);
  const [editingRows, setEditingRows] = useState([]);

  const menuRef = useRef();
  const tableBodyRef = useRef();

  const updateSelectAll = () => {
    if (selectAll) {
      setSelected(Object.assign({}, Array(rowData.length).fill(false)));
      setSelectAll(false);
    } else {
      setSelected(Object.assign({}, Array(rowData.length).fill(true)));
      setSelectAll(true);
    }
  };

  const updateSelect = (e) => {
    const selectedItemId = e.target.dataset.id;
    setSelected((prevState) => {
      return {
        ...prevState,
        [selectedItemId]: !prevState[selectedItemId]
      };
    });
  };

  useEffect(() => {
    const toolBar = menuRef.current.children[0];
    const menu = menuRef.current;

    const sum = Object.values(selected).reduce((sum, val) => sum + val, 0);
    if (sum > 0) {
      toolBar.classList.add(styles.ItemSelected_ToolBar);
      menu.classList.add(styles.ItemSelected_Menu);
    } else {
      toolBar.classList.remove(styles.ItemSelected_ToolBar);
      menu.classList.remove(styles.ItemSelected_Menu);
    }
  }, [selected]);

  useEffect(() => {
    for (const row of editingRows) {
      const rowValues = Array.from(row.children);
      rowValues.shift();
      rowValues.pop();
      rowValues.forEach((val) => {
        val.contentEditable = true;
      });
    }
  }, [editingRows]);

  const updateRow = (event) => {
    const parent = event.target.parentNode.parentNode;
    const checkbox = parent.children[0].children[0];
    const index = parent.dataset.id;
    const rows = Array.from(parent.children);
    const rowsData = rows.slice(1, rows.length - 1);
    const newData = rowsData.map((val) => val.textContent);

    rowsData.forEach((val) => {
      val.contentEditable = false;
    });
    const newRowData = [...rowData];
    newRowData[index] = newData;

    console.log(typeof newRowData);

    setTableRows(newRowData);
    setRowData(newRowData);
    setSelected((prevState) => ({ ...prevState, [index]: false }));

    checkbox.disabled = false;
    checkbox.checked = false;
    event.target.classList.remove(styles.Editing);
  };

  const getSelectedItemsIndexes = () => {
    return Object.values(selected)
      .map((val, idx) => {
        if (val) {
          return idx;
        }
        return null;
      })
      .filter((val) => val !== null);
  };

  const editSelectedRow = (event) => {
    const indexes = getSelectedItemsIndexes();
    console.log(indexes);
    const htmlRows = getHtmlRows();
    const editableRows = [];
    htmlRows.forEach((row, idx) => {
      for (let index of indexes) {
        if (index === idx) {
          const rowEntries = row.children;
          rowEntries[0].children[0].disabled = true;
          console.log(
            rowEntries[rowEntries.length - 1].children[0].classList.add(
              styles.Editing
            )
          );
          editableRows.push(row);
        }
      }
      if (editableRows.length > 0) {
        setEditingRows(editableRows);
      }
    });
  };

  const deleteSelectedRow = (event) => {
    const indexes = getSelectedItemsIndexes();
    const remainingRows = rowData.filter((row, id) => !indexes.includes(id));
    setTableRows(remainingRows);
    setRowData(remainingRows);
    setSelected(Object.assign({}, Array(tableRows.length).fill(false)));
  };

  const getHtmlRows = () => {
    return Array.from(tableBodyRef.current.children);
  };

  const sortByColumn = useMemo(
    () => (event) => {
      const column = event.target;
      let sortOrder = column.dataset.sortOrder;
      if (!sortOrder || sortOrder === "descending") {
        sortOrder = "ascending";
      } else {
        sortOrder = "descending";
      }
      column.dataset.sortOrder = sortOrder;
      const columnName = event.target.textContent;
      const columnIndex = headers.indexOf(columnName) + 1;
      const rows = [...tableRows];
      setTableRows(
        rows.sort((a, b) => {
          const index = columnIndex - 1;
          if (sortOrder === "ascending") {
            return new Intl.Collator().compare(a[index], b[index]);
          } else {
            return new Intl.Collator().compare(b[index], a[index]);
          }
        })
      );
    },
    [tableRows, headers]
  );

  const searchFilter = useMemo(
    () => (event) => {
      const searchTerm = event.target.value.toLowerCase();

      if (!searchTerm) {
        setTableRows(rowData);
        return;
      }
      const resultRows = rowData.filter((row) => {
        for (let val of row) {
          val = val.toString().toLowerCase();
          if (val.includes(searchTerm)) {
            return true;
          }
        }
        return false;
      });

      setTableRows(resultRows);
    },
    [rowData]
  );

  return (
    <div>
      <div ref={menuRef} className={styles.Menu}>
        <div className={styles.ToolBarContainer}>
          <button onClick={editSelectedRow}>edit</button>
          <button onClick={deleteSelectedRow}>delete</button>
        </div>
        <div>
          <input
            className={styles.Filter}
            type="search"
            onChange={searchFilter}
            placeholder="Filter"
          />
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                value={selectAll}
                onChange={updateSelectAll}
              />
            </th>
            {headers.map((head, idx) => (
              <th key={head} onClick={(event) => sortByColumn(event)}>
                {head}
              </th>
            ))}
          </tr>
        </thead>
        <tbody ref={tableBodyRef}>
          {tableRows.map((row, idx) => (
            <tr
              key={Object.keys(selected)[idx]}
              data-id={Object.keys(selected)[idx]}
            >
              <td>
                <input
                  data-id={Object.keys(selected)[idx]}
                  checked={selected[idx]}
                  onChange={(e) => {
                    updateSelect(e);
                  }}
                  type="checkbox"
                />
              </td>
              {row.map((value) => (
                <td key={value}>{value}</td>
              ))}
              <td>
                <button onClick={(event) => updateRow(event)}>done</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
