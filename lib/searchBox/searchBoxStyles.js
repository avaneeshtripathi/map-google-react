"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var searchBoxCtr = {
    position: 'absolute',
    width: '96%',
    top: 0,
    left: '2%',
};
exports.searchBoxCtr = searchBoxCtr;
var searchInput = {
    boxSizing: 'border-box',
    border: '1px solid transparent',
    width: '100%',
    marginTop: '10px',
    padding: '12px',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.3)',
    fontSize: '14px',
    outline: 'none',
    textOverflow: 'ellipsis',
    borderRadius: '3px',
};
exports.searchInput = searchInput;
var suggestionsCtr = {
    fontSize: '12px',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.3)',
    borderBottomLeftRadius: '4px',
    borderBottomRightRadius: '4px',
    overflow: 'hidden',
};
exports.suggestionsCtr = suggestionsCtr;
var suggestionItem = {
    backgroundColor: '#ffffff',
    cursor: 'pointer',
    padding: '6px 10px',
    borderTop: '1px solid #d1d1d1',
};
exports.suggestionItem = suggestionItem;
var active = {
    backgroundColor: '#fafafa',
    fontWeight: 600,
};
exports.active = active;
var hover = {
    backgroundColor: '#fafafa',
};
exports.hover = hover;
//# sourceMappingURL=searchBoxStyles.js.map