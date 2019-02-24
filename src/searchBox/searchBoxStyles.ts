const searchBoxCtr = {
    position: 'absolute' as 'absolute',
    width: '96%',
    top: 0,
    left: '2%',
};

const searchInput = {
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

const suggestionsCtr = {
    fontSize: '12px',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.3)',
    borderBottomLeftRadius: '4px',
    borderBottomRightRadius: '4px',
    overflow: 'hidden',
};

const suggestionItem = {
    backgroundColor: '#ffffff',
    cursor: 'pointer',
    padding: '6px 10px',
    borderTop: '1px solid #d1d1d1',
};

const active = {
    backgroundColor: '#fafafa',
    fontWeight: 600,
};

const hover = {
    backgroundColor: '#fafafa',
};

export {
    searchBoxCtr,
    searchInput,
    suggestionsCtr,
    suggestionItem,
    active,
    hover,
};
