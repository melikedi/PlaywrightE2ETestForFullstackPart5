to configure playwright
1. npm init
2.npm init playwright@latest
3.Let's define an npm script for running tests and test reports in package.json:

        {
        // ...
        "scripts": {
            "test": "playwright test",
            "test:report": "playwright show-report"
        },
        // ...
        }
