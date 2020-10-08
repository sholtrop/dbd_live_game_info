FROM cypress/browsers

WORKDIR /app
RUN ["yarn", "add", "cypress-wait-until"]
CMD ["npx", "cypress", "run", "--browser chrome"]