import React, { useEffect, useCallback, useState } from "react";
import { Box } from "@mui/material";
import isEmpty from "lodash/isEmpty";
import { getUserFollowedRepositories } from "./repository";
import { LOADING_HEIGHT } from "./common/constants";
import Loading from "./common/Loading";
import Title from "./common/Title";
import SearchAndFilter from "./common/SearchAndFilter";
import FollowedRepositoryCard from "./FollowedRepositoryCard";

const FollowedRespositories = () => {
  const [followedRepositories, setFollowedRepositories] = useState(null);
  console.log(followedRepositories);
  const [isLoading, setIsLoading] = useState(true);
  const [filtersWithValues, setFiltersWithValues] = useState(null);
  const [filters, setFilters] = useState([]);
  const [search, setSearch] = useState("");
  const [filteredRepositories, setFilteredRepositories] =
    useState(followedRepositories);

  console.log("filters", filters);
  console.log("search", search);
  console.log("filterswihvalues", filtersWithValues);

  const fetchFollowedRepositories = useCallback(async () => {
    const response = await getUserFollowedRepositories();

    setFollowedRepositories(response.data.followedRepositories);
    console.log("res", response);

    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchFollowedRepositories();
  }, [fetchFollowedRepositories]);

  useEffect(() => {
    const filteredRepos = [];
    let hasBeenFiltered = false;

    if (
      !!followedRepositories &&
      !isEmpty(filtersWithValues) &&
      !isEmpty(filters)
    ) {
      followedRepositories.forEach((repo) => {
        let matches = false;
        if (!isEmpty(filters)) {
          hasBeenFiltered = true;
          filters.forEach((filt) => {
            if (repo[filt.key] === filt.value) {
              matches = true;
            }
          });
        }

        if (search !== "" && matches) {
          hasBeenFiltered = true;
          if (!repo.repo.includes(search)) {
            matches = false;
          }
        }

        if (matches) {
          filteredRepos.push(repo);
        }
      });

      setFilteredRepositories(filteredRepos);
    } else {
      setFilteredRepositories(followedRepositories);
    }
  }, [filters, search]);

  useEffect(() => {
    if (!isEmpty(followedRepositories)) {
      const initialFilters = {
        language: {
          key: "language",
          display: "Language",
          type: "string",
          values: [],
        },
        timesForked: {
          key: "timesForked",
          display: "Times Forked",
          type: "numeric",
          values: [],
        },
        updated: {
          key: "updated",
          display: "Last Updated",
          type: "date",
          values: [],
        },
      };
      followedRepositories.forEach(({ language, timesForked, updated }) => {
        if (!initialFilters.language.values.some((item) => item === language)) {
          initialFilters.language.values.push(language);
        }
        if (
          !initialFilters.timesForked.values.some(
            (item) => item === timesForked
          )
        ) {
          initialFilters.timesForked.values.push(timesForked);
        }
        if (!initialFilters.updated.values.some((item) => item === updated)) {
          initialFilters.updated.values.push(updated);
        }
      });

      setFiltersWithValues(initialFilters);
    }
  }, [followedRepositories]);

  return (
    <Box>
      {isLoading ? (
        <Box height={LOADING_HEIGHT}>
          <Loading />
        </Box>
      ) : (
        <Box width="100%">
          <Title text="Followed Repositories" />
          <Box paddingLeft="4px">
            <Box>
              <SearchAndFilter
                filters={filtersWithValues}
                setFilters={(data) => {
                  setFilters(data);
                }}
                setSearch={(data) => {
                  setSearch(data);
                }}
              />
            </Box>
            <Box>
              {filteredRepositories?.map(
                ({ repo, language, description, updated, timesForked }) => (
                  <FollowedRepositoryCard
                    key={repo}
                    repo={repo}
                    language={language}
                    description={description}
                    updated={updated}
                    timesForked={timesForked}
                  />
                )
              )}
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default FollowedRespositories;
