import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { client } from '../util/client'
import { Segment, PostEditArgument, httpRequestState } from '../types'

const initialState: httpRequestState = {
  status: 'idle',
  error: undefined,
}

export const postVideoInformation = createAsyncThunk('video/postVideoInformation', async (argument: PostEditArgument) => {
  const response = await client.post(`${argument.ocUrl}/editor/${argument.mediaPackageId}/edit.json`,
    { segments: convertSegments(argument.segments), tracks: argument.tracks }
  )
  return response
})

/**
 * Slice for managing a post request for saving current changes
 * TODO: Create a wrapper for this and workflowPostAndProcessSlice
 */
const workflowPostSlice = createSlice({
  name: 'workflowPostState',
  initialState,
  reducers: {
  },
  extraReducers: builder => {
    builder.addCase(
      postVideoInformation.pending, (state, action) => {
        state.status = 'loading'
    })
    builder.addCase(
      postVideoInformation.fulfilled, (state, action) => {
        state.status = 'success'
    })
    builder.addCase(
      postVideoInformation.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message
    })
  }
})

interface segmentAPI {
  start: number,
  end: number,
  deleted: boolean,
  selected: boolean,
}

// Convert a segment from how it is stored in redux into
// a segment that can be send to Opencast
export const convertSegments = (segments: Segment[]) => {
  let newSegments: segmentAPI[] = []

  segments.forEach(segment => {
    newSegments.push({
      start: segment.start,
      end: segment.end,
      deleted: segment.deleted,
      selected: false,
    })
  });

  return newSegments
}

export const selectStatus = (state: { workflowPostState: { status: httpRequestState["status"] } }) =>
  state.workflowPostState.status
export const selectError = (state: { workflowPostAndProcessState: { error: httpRequestState["error"] } }) =>
  state.workflowPostAndProcessState.error

export default workflowPostSlice.reducer
