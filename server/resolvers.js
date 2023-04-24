import { Job, Company } from "./db.js";
import { PubSub } from "graphql-subscriptions";

const pubSub = new PubSub();
const JOB_ADDED = "JOB_ADDED";
const COMPANY_ADDED = "COMPANY_ADDED";

export const resolvers = {
  Query: {
    job: (root, { id }) => {
      console.log(id);
      //dbconnection search on mongo
      //neo4j db search
      //http://localhost:3001/jobs/1
      return Job.findById(id);
    },
    jobs: async () => Job.findAll(),
    hello: () => "Hello World",
    companies: async () => Company.findAll(),
    company: async (root, { id }) => {
      console.log(id);
      return Company.findById(id);
    },
  },

  Job: {
    company: async (job) => {
      console.log(job);
      return Company.findById(job.companyId);
    },
  },

  Mutation: {
    addCompany: async (root, { input }) => {
      console.log(input);

      const company = await Company.create({
        name: input.name,
        description: input.description,
      } );
      pubSub.publish(COMPANY_ADDED, { companyAdded: company });
      return company;
    },

    deleteCompany: async (root, input) => {
      console.log(input);
      const company = await Company.delete(input.id);
      return company;
    },
    deleteJob: async (root, jobIdInput) => {
      console.log(input);
      const job = await Job.findById(jobIdInput.id);
      const company = await Company.findById(job.companyId);
      const companyJobs = await Company.delete(company.id);
      //const job = await Job.delete(input.id);
      return job;
    },
  },

  Subscription: {
    jobAdded: {
      subscribe: () => pubSub.asyncIterator([JOB_ADDED]),
    },
    companyAdded: {
      subscribe: () => pubSub.asyncIterator([COMPANY_ADDED]),
    },
  },
};
