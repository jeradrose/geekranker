namespace GeekRankerApi.Models {
    public class GetRankingsRequest {
        public string[] Usernames { get; set; }
        public int[] GameIds { get;set; }
    }
}
