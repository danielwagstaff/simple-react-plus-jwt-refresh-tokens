
namespace Restaurants.Models.DTOs
{
    public class RestaurantDto
    {
        public long Id { get; set; }

        public long OwnerId { get; set; }

        public string BusinessName { get; set; }

        public string AddressLine1 { get; set; }

        public string AddressLine2 { get; set; }

        public string Town { get; set; }

        public string County { get; set; }

        public string PostCode { get; set; }

        public string Email { get; set; }

        public string Phone { get; set; }

        public int NumberOfAvailableServings { get; set; }
    }
}
