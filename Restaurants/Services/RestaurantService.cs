using Microsoft.Extensions.Logging;
using Restaurants.Entities;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Restaurants.Services
{
    public interface IRestaurantService
    {
        IEnumerable<Restaurant> Search(long? userId);
        Restaurant Add(Restaurant restaurant);
        void Verify(long restaurantId);
        void UpdateNumberOfServings(long userId, long restaurantId, int numberAvailable);
        bool Remove(long userId, long restaurantId);
    }

    public class RestaurantService : IRestaurantService
    {
        private static readonly List<Restaurant> restaurants = new List<Restaurant>();
        private readonly ILogger<RestaurantService> _logger;
        public RestaurantService(ILogger<RestaurantService> logger)
        {
            _logger = logger;
        }

        public IEnumerable<Restaurant> Search(long? userId)
        {
            return from restaurant in restaurants
                   where userId == null || restaurant.OwnerId == userId
                   select restaurant;
        }

        public Restaurant Add(Restaurant newRestaurant)
        {
            var userAlreadyHasRestaurant = restaurants.Any(restaurant => restaurant.OwnerId == newRestaurant.OwnerId);

            var newRestaurantIsUnique = !restaurants.Any(restaurant => 
                restaurant.PostCode == newRestaurant.PostCode
                && restaurant.BusinessName == newRestaurant.BusinessName);

            if (!userAlreadyHasRestaurant)
            {
                if (newRestaurantIsUnique)
                {
                    newRestaurant.Id = (restaurants.LastOrDefault() ?? new Restaurant()).Id + 1;
                    newRestaurant.IsVerified = false;
                    restaurants.Add(newRestaurant);
                    return newRestaurant;
                }
                else
                {
                    throw new RestaurantAlreadyExistsException();
                }
            }
            else
            {
                throw new OwnerAlreadyHasRestaurantException();
            }
        }

        public void Verify(long restaurantId)
        {
            try
            {
                var restaurant = restaurants.SingleOrDefault(restaurant => restaurant.Id == restaurantId);
                if (restaurant != null)
                {
                    restaurant.IsVerified = true;
                    _logger.LogInformation($"Successfully validated restaurant, ID={restaurant.Id}");
                }
                else
                {
                    throw new RestaurantDoesNotExistException();
                }
            }
            catch (InvalidOperationException)
            {
                throw new RestaurantIdDuplicatedException();
            }
        }

        public void UpdateNumberOfServings(long userId, long restaurantId, int numberAvailable)
        {
            try
            {
                var restaurant = restaurants.SingleOrDefault(restaurant => restaurant.Id == restaurantId);
                if (restaurant != null)
                {
                    if (restaurant.OwnerId == userId)
                    {
                        restaurant.NumberOfAvailableServings = numberAvailable;
                        _logger.LogInformation($"Successfully updated restaurant (ID={restaurant.Id}) available servings to {numberAvailable}");
                    }
                    else
                    {
                        throw new RestaurantNotOwnedByRequestorException();
                    }
                }
                else
                {
                    throw new RestaurantDoesNotExistException();
                }
            }
            catch (InvalidOperationException)
            {
                throw new RestaurantIdDuplicatedException();
            }
        }

        public bool Remove(long userId, long restaurantId)
        {
            try
            {
                var restaurant = restaurants.SingleOrDefault(restaurant => restaurant.Id == restaurantId);
                if (restaurant != null)
                {
                    if (restaurant.OwnerId == userId)
                    {
                        if (restaurants.Remove(restaurant))
                        {
                            _logger.LogInformation($"Successfully removed restaurant, ID={restaurant.Id}");
                            return true;
                        }
                        else
                        {
                            _logger.LogError($"Could not remove restaurant, ID={restaurant.Id}");
                            return false;
                        }
                    }
                    else
                    {
                        throw new RestaurantNotOwnedByRequestorException();
                    }
                }
                else
                {
                    throw new RestaurantDoesNotExistException();
                }
            }
            catch (InvalidOperationException)
            {
                throw new RestaurantIdDuplicatedException();
            }
        }
    }

    public class RestaurantAlreadyExistsException : Exception
    {
        public RestaurantAlreadyExistsException() : base() { }
        public RestaurantAlreadyExistsException(string message) : base(message) { }
        public RestaurantAlreadyExistsException(string message, System.Exception inner) : base(message, inner) { }
    }

    public class RestaurantDoesNotExistException : Exception
    {
        public RestaurantDoesNotExistException() : base() { }
        public RestaurantDoesNotExistException(string message) : base(message) { }
        public RestaurantDoesNotExistException(string message, System.Exception inner) : base(message, inner) { }
    }

    public class OwnerAlreadyHasRestaurantException : Exception
    {
        public OwnerAlreadyHasRestaurantException() : base() { }
        public OwnerAlreadyHasRestaurantException(string message) : base(message) { }
        public OwnerAlreadyHasRestaurantException(string message, System.Exception inner) : base(message, inner) { }
    }

    public class RestaurantNotOwnedByRequestorException : Exception
    {
        public RestaurantNotOwnedByRequestorException() : base() { }
        public RestaurantNotOwnedByRequestorException(string message) : base(message) { }
        public RestaurantNotOwnedByRequestorException(string message, System.Exception inner) : base(message, inner) { }
    }

    public class RestaurantIdDuplicatedException : Exception
    {
        public RestaurantIdDuplicatedException() : base() { }
        public RestaurantIdDuplicatedException(string message) : base(message) { }
        public RestaurantIdDuplicatedException(string message, System.Exception inner) : base(message, inner) { }
    }
}
