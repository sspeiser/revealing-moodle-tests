import { RevealingMoodleTests } from ".";

// import { * } from './index';
require('./index');

it('works to render an empty object', () =>{
    const tests = new RevealingMoodleTests();

    const matchDocRE = /<quiz>.*<\/quiz>/s;
    expect(matchDocRE.test(tests.createXML())).toBeTruthy();
});