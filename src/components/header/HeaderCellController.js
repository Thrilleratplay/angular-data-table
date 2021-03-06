import { isOldAngular, NextSortDirection } from '../../utils/utils';

export default class HeaderCellController {
  /* @ngInject */
  constructor($scope) {
    Object.assign(this, {
      $scope,
    });

    if (isOldAngular()) {
      this.$onInit();
    }
  }

  $onInit() {
    this.init();
  }

  init() {
    if (this.column.headerCheckbox) {
      this.column.headerCheckboxCallback = this.rowSelected;
    }

    if (this.$scope.$parent.$parent.$parent.$parent.dt) {
      this.dt = this.$scope.$parent.$parent.$parent.$parent.dt;
    }
  }
  /**
   * Calculates the styles for the header cell directive
   * @return {styles}
   */
  styles() {
    return {
      width: `${this.column.width}px`,
      minWidth: `${this.column.minWidth}px`,
      maxWidth: `${this.column.maxWidth}px`,
      height: `${this.column.height}px`,
    };
  }

  /**
   * Calculates the css classes for the header cell directive
   */
  cellClass() {
    const cls = {
      sortable: this.column.sortable,
      resizable: this.column.resizable,
    };

    if (this.column.headerClassName) {
      cls[this.column.headerClassName] = true;
    }

    return cls;
  }

  /**
   * Toggles the sorting on the column
   */
  onSorted(event) {
    if (this.column.sortable) {
      this.column.sort = NextSortDirection(this.sortType, this.column.sort);

      if (angular.isUndefined(this.column.sort)) {
        this.column.sortPriority = undefined;
      }

      this.onSort({
        column: this.column,
        modifierPressed: event.shiftKey,
      });
    }
  }

  /**
   * Toggles the css class for the sort button
   */
  sortClass() {
    return {
      'sort-btn': true,
      'sort-asc icon-down': this.column.sort === 'asc',
      'sort-desc icon-up': this.column.sort === 'desc',
    };
  }

  /**
   * Updates the column width on resize
   * @param  {width}
   * @param  {column}
   */
  onResized(width, column) {
    this.onResize({
      column,
      width,
    });
  }

  rowSelected(dt) {
    this.allRowsSelected = (dt.selected) && (dt.rows.length === dt.selected.length);
  }

  /**
   * Invoked when the header cell directive checkbox is changed
   */
  checkboxChangeCallback() {
    this.isAllRowsSelected = this.column.allRowsSelected;

    return this.isAllRowsSelected ?
      this.dt.selectAllRows() :
      this.dt.deselectAllRows();
  }
}
