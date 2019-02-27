import css from 'styled-jsx/css';

const styles = css`
    .searchBoxCtr {
        position: absolute;
        width: 96%;
        top: 0;
        left: 2%;
        z-index: 9;
    }
    .searchInput {
        box-sizing: border-box;
        border: 1px solid transparent;
        width: 100%;
        margin-top: 10px;
        padding: 12px;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
        font-size: 14px;
        outline: none;
        text-overflow: ellipsis;
        border-radius: 3px;
    }
    .suggestionsCtr {
        font-size: 0.857rem;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
        border-bottom-left-radius: 4px;
        border-bottom-right-radius: 4px;
        overflow: hidden;
    }
    .suggestionItem {
        cursor: pointer;
        padding: 6px 10px;
        display: flex;
        align-items: center;
        color: #7e859b;
        background-color: #fff;
        border-top: 1px solid #e2e5f1;
    }
    .suggestionItem img {
        height: 20px;
        margin-right: 10px;
        opacity: 0.3;
    }
    .suggestionItem.active {
        font-weight: 600;
        color: #404553;
        background-color: #f7f7fa;
    }
    .suggestionItem.active img {
        opacity: 1;
    }
    .suggestionItem:hover {
        color: #404553;
        background-color: #f7f7fa;
    }
`;
export default styles;
