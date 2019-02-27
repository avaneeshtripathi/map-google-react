import css from 'styled-jsx/css';

const styles = css`
    .ctr {
        position: relative;
        height: 100%;
    }
    .mapCtr {
        height: 100%;
    }

    // RESET DEFAULT INFO WINDOW
    :global(.gm-style-iw-t:before),
    :global(.gm-style-iw-t:after) {
        content: unset !important;
    }
    :global(.gm-style-iw) {
        width: 160px !important;
        border-radius: unset !important;
        padding: 10px !important;
        top: 4px !important;
        overflow: unset !important;
    }
    :global(.gm-style-iw-d) {
        overflow: unset !important;
    }
    :global(button.gm-ui-hover-effect) {
        display: none !important;
    }
`;

export default styles;
