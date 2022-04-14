import { parallelCanAssignHelpers, setParallelCanAssign } from '../'

const { atMostOnePicklePerTag } = parallelCanAssignHelpers

setParallelCanAssign(atMostOnePicklePerTag(['@tag1', '@tag2']))
