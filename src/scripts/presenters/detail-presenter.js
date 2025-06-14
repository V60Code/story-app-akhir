import StoryModel from '../models/story-model.js';
import DetailView from '../views/detail-view.js';
import { getLocationName } from '../utils/location.js';

const DetailPresenter = {
  async init(container, id) {
    try {
      const story = await StoryModel.getDetail(id);
      const location =
        story.lat && story.lon ? await getLocationName(story.lat, story.lon) : 'Tidak diketahui';
      DetailView.render(container, { ...story, location });
    } catch (error) {
      DetailView.showError(container, error.message);
    }
  },
};

export default DetailPresenter;
