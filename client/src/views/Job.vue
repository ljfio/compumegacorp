<template>
    <div class="job container">
      <h1>{{ name }}</h1>

      <p>Started {{remaining}} ago</p>

      <form @submit.prevent="join" v-if="!isUserPresent">
        <fieldset>
          <fieldset class="form-group">
            <legend>Select a Task</legend>
            <div class="form-check" v-for="task in tasks" :key="task._id">
              <label class="form-check-label">
                <input type="radio" class="form-check-input" v-model="selectedTaskId" :value="task._id" />
                {{ task.name }}
              </label>
            </div>
          </fieldset>
        </fieldset>

        <button class="btn btn-primary" type="submit">Join</button>
      </form>

      <form @submit.prevent="blame" v-if="isUserPresent && !hasUserBlamed">
        <fieldset class="form-group">
          <legend>Select a User to Blame</legend>
          <div class="form-check" v-for="member in members" :key="member._id">
            <label class="form-check-label">
              <input type="radio" class="form-check-input" v-model="selectedMemberId" :value="member._id" />
              {{ member.name }}
            </label>
          </div>
        </fieldset>

        <button class="btn btn-primary" type="submit">Blame</button>
      </form>

      <p v-if="isUserPresent && hasUserBlamed">Waiting for the stragglers to finish their work!</p>
    </div>
</template>

<script>
import auth from "@/auth";
import countdown from "countdown";

export default {
  data() {
    return {
      selectedTaskId: "",
      selectedMemberId: "",
      name: "",
      tasks: [],
      members: [],
      blamed: [],
      timer: null,
      remaining: "",
    };
  },
  computed: {
    isUserPresent() {
      return this.members.findIndex(v => v._id == auth.getUserId()) > -1;
    },
    hasUserBlamed() {
      return this.blamed.findIndex(v => v.userId == auth.getUserId()) > -1;
    }
  },
  destroyed() {
    window.clearInterval(this.timer);
  },
  created() {
   this.loadData();
  },
  methods: {
    join() {
      auth.http().post('/job/' + this.$route.params.id + '/task/' + this.selectedTaskId)
        .then(result => {
          this.loadData();
        });
    },
    blame() {
      auth.http().post('/job/' + this.$route.params.id + '/blame/' + this.selectedMemberId)
        .then(result => {
          this.loadData();
        });
    },
    loadData() {
       auth
        .http()
        .get("/job/" + this.$route.params.id)
        .then(jobResult => {
          this.name = jobResult.data.name;
          this.tasks = [];
          this.members = [];
          this.blamed = jobResult.data.blamed;

          // Set ticking timer
          window.clearInterval(this.timer);
          this.timer = countdown(new Date(jobResult.data.posted), (ts) => {
            this.remaining = ts.toString();
          }, countdown.HOURS | countdown.MINUTES);

          // Obtain information about each task linked to the job
          jobResult.data.tasks.forEach(element => {
            auth.http()
              .get("/task/" + element)
              .then(taskResult => {
                this.tasks.push(taskResult.data);
              });
          });

          // Obtain information about each user linked to a job
          jobResult.data.allocations.map(a => a.userId).forEach(element => {
            auth.http()
              .get("/user/" + element)
              .then(userResult => {
                this.members.push(userResult.data);
              });
          })
        });
    }
  }
};
</script>

