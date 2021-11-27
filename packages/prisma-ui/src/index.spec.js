import Container from './Container';
import FlexContainer from './FlexContainer';
import { FlexContainer as FlexContainerDefault, Container as ContainerDefault } from './';

describe('index.js exports', () => {
  it('imports Container from index.js same as direct import', () => {
    expect(Container).toBe(ContainerDefault);
  });

  it('imports FlexContainer from index.js same as direct import', () => {
    expect(FlexContainer).toBe(FlexContainerDefault);
  });
});
