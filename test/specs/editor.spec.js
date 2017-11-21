const Editor = require('../../dist/index');
const { expect } = require('chai');

describe('Editor', () => {
    const div = () => document.createElement('div');

    describe('output', () => {
        it('renders edtitor', () => {
            const el = div();
            new Editor({
                target: el
            });

            const editorWrapper = el.querySelector('.cl');
            expect(editorWrapper).to.not.be.undefined;
        });
    });
});